// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

import { DeleteRequest, DeleteResult } from '@edfi/meadowlark-core';
import {
  deleteEntityByIdDynamo,
  deleteItems,
  getForeignKeyReferences,
  getReferencesToThisItem,
  validateEntityOwnership,
} from './DynamoEntityRepository';

/**
 * Deletes the primary item from DynamoDB.
 */
export async function deleteEntityById({ id, resourceInfo, security, traceId }: DeleteRequest): Promise<DeleteResult> {
  try {
    if (security.authorizationStrategy === 'OWNERSHIP_BASED') {
      const { isOwner, result: ownershipResult } = await validateEntityOwnership(
        id,
        resourceInfo,
        security.clientName,
        traceId,
      );

      if (ownershipResult === 'ERROR') {
        return { response: 'UNKNOWN_FAILURE' };
      }

      if (ownershipResult === 'NOT_FOUND') {
        return { response: 'DELETE_FAILURE_NOT_EXISTS' };
      }

      if (!isOwner) {
        return { response: 'DELETE_FAILURE_NOT_EXISTS' };
      }
    }

    const foreignKeysLookup = await getReferencesToThisItem(id, traceId);
    if (!foreignKeysLookup.success || foreignKeysLookup.foreignKeys?.length > 0) {
      const fks = foreignKeysLookup.foreignKeys.map((fk) => fk.Description);
      const failureMessage = JSON.stringify({
        error: 'Unable to delete this item because there are foreign keys pointing to it',
        foreignKeys: fks,
      });

      return { response: 'DELETE_FAILURE_REFERENCE', failureMessage };
    }

    const { success } = await deleteEntityByIdDynamo(id, resourceInfo, traceId);

    if (!success) {
      return { response: 'UNKNOWN_FAILURE' };
    }

    // Now that the main object has been deleted, we need to delete the foreign key references
    const { success: fkSuccess, foreignKeys } = await getForeignKeyReferences(id, traceId);

    if (fkSuccess) {
      // Delete the (FREF, TREF) records
      await deleteItems(
        foreignKeys.map((i) => ({ pk: i.From, sk: i.To })),
        traceId,
      );
      // And now reverse that, to delete the (TREF, FREF) records
      await deleteItems(
        foreignKeys.map((i) => ({ pk: i.To, sk: i.From })),
        traceId,
      );
    } // Else: user can't resolve this error, and it should be logged already. Ignore.

    return { response: 'DELETE_SUCCESS' };
  } catch (e) {
    return { response: 'UNKNOWN_FAILURE' };
  }
}
