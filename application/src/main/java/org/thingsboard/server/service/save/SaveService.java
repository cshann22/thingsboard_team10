package org.thingsboard.server.service.save;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.thingsboard.server.common.data.id.HasId;
import org.thingsboard.server.common.data.HasName;
import org.thingsboard.server.common.data.id.EntityId;
import org.thingsboard.server.common.data.id.TenantId;
import org.thingsboard.server.common.data.exception.ThingsboardException;
import org.thingsboard.server.service.security.model.SecurityUser;


import java.util.function.BiFunction;

/**
 * Service for saving entities with security context.
 */
@Service
public class SaveService {


    /**
     * Retrieves the current authenticated user.
     *
     * @return the current authenticated SecurityUser
     * @throws ThingsboardException if the authentication principal is not a SecurityUser or if there is an error retrieving the authentication
     */
    protected SecurityUser getCurrentUser() throws ThingsboardException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            if (authentication.getPrincipal() instanceof SecurityUser) {
                return (SecurityUser) authentication.getPrincipal();
            } else {
                throw new ThingsboardException();
            }
        } else {
            throw new ThingsboardException();
        }
    }

    /**
     * Saves an entity.
     *
     * @param tenantId the tenant ID
     * @param entity the entity to save
     * @param savingFunction the function to save the entity
     * @param <E> the type of the entity
     * @return the saved entity
     * @throws ThingsboardException if there is an error during saving
     */
    public <E extends HasName & HasId<? extends EntityId>> E saveEntity(TenantId tenantId, E entity, BiFunction<TenantId, E, E> savingFunction) throws ThingsboardException {
        try {
            return savingFunction.apply(tenantId, entity);
        } catch (Exception e) {
            throw new ThingsboardException();
        }
    }
}