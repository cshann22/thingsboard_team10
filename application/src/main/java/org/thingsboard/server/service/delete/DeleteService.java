/**
 * Copyright © 2016-2024 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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