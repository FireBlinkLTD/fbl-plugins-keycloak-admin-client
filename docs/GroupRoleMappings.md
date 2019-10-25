# Group Role Mappings

Allows to retrieve or modify group mappings.

## Get Group Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.roles.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.roles.get`
- `keycloak.group.mappings.roles.get`

### Example

```yaml
keycloak.group.mappings.roles.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

  # [optional] Assign group role mappings to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignRoleMappingsTo: $.ctx.group

  # [optional] Push group role mappings to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushRoleMappingsTo: $.ctx.groups
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

## Add Group Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.roles.add

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.roles.add`
- `keycloak.group.mappings.roles.add`

### Example

```yaml
keycloak.group.mappings.roles.add:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

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

## Delete Group Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.roles.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.roles.delete`
- `keycloak.group.mappings.roles.delete`

### Example

```yaml
keycloak.group.mappings.roles.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

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

## Apply Group Role Mappings

Convinient way to make make group roles equal to given ones only. Non specified role mappings will be removed. Missing - added.

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.roles.apply

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.roles.apply`
- `keycloak.group.mappings.roles.apply`

### Example

```yaml
keycloak.group.mappings.roles.apply:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

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
