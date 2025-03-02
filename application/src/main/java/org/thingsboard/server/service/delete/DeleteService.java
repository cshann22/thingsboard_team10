package org.thingsboard.server.service.delete;

import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.id.EntityId;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.exception.ThingsboardException;

import java.util.function.BiConsumer;

/**
 * Service for saving entities with security context.
 */
@Service
public class DeleteService {

    /*
     * Deletes an entity.
     *
     * @param tenantId the tenant ID
     * @param entityId the entity ID
     * @param deleteFunction the function to delete the entity
     * @param <I> the type of the entity ID
     * @throws ThingsboardException if there is an error during deletion
     */
    public <I extends EntityId> void deleteEntity(TenantId tenantId, I entityId, BiConsumer<TenantId, I> deleteFunction) throws ThingsboardException {
        try {
            deleteFunction.accept(tenantId, entityId);
        } catch (Exception e) {
            throw new ThingsboardException();
        }
    }
    
    
}