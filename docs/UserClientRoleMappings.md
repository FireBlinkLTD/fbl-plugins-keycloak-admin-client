# User Clients Roles Mappings

Modify client roles user mappings.

## Add Client Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.client.roles.add

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.client.roles.add`
- `keycloak.user.mappings.client.roles.add`

### Example

```yaml
keycloak.user.mappings.client.roles.add:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [optional] User name
  # Note: either username or email field is required
  username: admin

  # [optional] User email
  # Note: either username or email field is required
  email: admin@fireblink.com

  # [required] client-id
  clientId: client

  # [required] list of client roles to map with
  clientRoles:
    - d
    - e
```

## Delete Client Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.client.roles.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.client.roles.delete`
- `keycloak.user.mappings.client.roles.delete`

### Example

```yaml
keycloak.user.mappings.client.roles.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [optional] User name
  # Note: either username or email field is required
  username: admin

  # [optional] User email
  # Note: either username or email field is required
  email: admin@fireblink.com

  # [required] client-id
  clientId: client

  # [required] list of client roles to unmap
  clientRoles:
    - d
    - e
```

## Apply Client Role Mappings

This action will make sure user has only listed client roles mappings for provided clients.

Note: if you want to unassign all roles for one client just provide empty list of roles for that client.

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.client.roles.apply

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.client.roles.apply`
- `keycloak.user.mappings.client.roles.apply`

### Example

```yaml
keycloak.user.mappings.client.roles.apply:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [optional] User name
  # Note: either username or email field is required
  username: admin

  # [optional] User email
  # Note: either username or email field is required
  email: admin@fireblink.com

  # [required] client-id
  clientId: client

  # [required] list of client roles to map exactly with
  # Note: empty list will remove all currently mapped roles
  clientRoles:
    - d
    - e
```
