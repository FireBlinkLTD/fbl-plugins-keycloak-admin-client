# User Role Mappings

Allows to retrieve or modify user role mappings.

## Get User Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.roles.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.roles.get`
- `keycloak.user.mappings.roles.get`

### Example

```yaml
keycloak.user.mappings.roles.get:
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

  # [optional] Assign user role mappings to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignRoleMappingsTo: $.ctx.user

  # [optional] Push user role mappings to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushRoleMappingsTo: $.ctx.users
```

Mapping example:

```yaml
realm:
  - realmRole1
  - realmRole2
client:
  someClientId1:
    - client1Role1
  someClientId2:
    - client2Role1
    - clinet2Role2
```

## Add User Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.roles.add

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.roles.add`
- `keycloak.user.mappings.roles.add`

### Example

```yaml
keycloak.user.mappings.roles.add:
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

  # [required] roles to add to mappings
  roles:
    # [optional] realm roles to map with
    realm:
      - realmRoleName
    # [optional] client roles to map with
    client:
      someClientId1:
        - client1Role1
      someClientId2:
        - client2Role1
        - clinet2Role2
```

## Delete User Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.roles.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.roles.delete`
- `keycloak.user.mappings.roles.delete`

### Example

```yaml
keycloak.user.mappings.roles.delete:
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

  # [required] roles to remove from to mappings
  roles:
    # [optional] realm roles to unmap
    realm:
      - realmRoleName
    # [optional] client roles to unmap
    client:
      someClientId1:
        - client1Role1
      someClientId2:
        - client2Role1
        - clinet2Role2
```

## Apply User Role Mappings

Convinient way to make make user roles equal to given ones only. Non specified role mappings will be removed. Missing - added.

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.roles.apply

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.roles.apply`
- `keycloak.user.mappings.roles.apply`

### Example

```yaml
keycloak.user.mappings.roles.apply:
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

  # [required] roles to have exact mapping with
  roles:
    # [optional] realm roles
    realm:
      - realmRoleName
    # [optional] client roles
    client:
      someClientId1:
        - client1Role1
      someClientId2:
        - client2Role1
        - clinet2Role2
```
