# Client Service Account Role Mappings

Allows to retrieve or modify Service Account mappings.

## Get Service Account Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.service.account.mappings.roles.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.service.account.mappings.roles.get`
- `keycloak.client.service.account.mappings.roles.get`

### Example

```yaml
keycloak.client.service.account.mappings.roles.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] ClientID field, not simply ID
  clientId: api-service

  # [optional] Assign role mappings to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignRoleMappingsTo: $.ctx.mappings

  # [optional] Push role mappings to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushRoleMappingsTo: $.ctx.mappings
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

## Add Service Account Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.service.account.mappings.roles.add

**Aliases:**

- `fbl.plugins.keycloak.admin.client.service.account.mappings.roles.add`
- `keycloak.client.service.account.mappings.roles.add`

### Example

```yaml
keycloak.client.service.account.mappings.roles.add:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] ClientID field, not simply ID
  clientId: api-service

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

## Delete Service Account Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.service.account.mappings.roles.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.service.account.mappings.roles.delete`
- `keycloak.client.service.account.mappings.roles.delete`

### Example

```yaml
keycloak.client.service.account.mappings.roles.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] ClientID field, not simply ID
  clientId: api-service

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

## Apply Service Account Role Mappings

Convinient way to make make Service Account roles equal to given ones only. Non specified role mappings will be removed. Missing - added.

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.service.account.mappings.roles.apply

**Aliases:**

- `fbl.plugins.keycloak.admin.client.service.account.mappings.roles.apply`
- `keycloak.client.service.account.mappings.roles.apply`

### Example

```yaml
keycloak.client.service.account.mappings.roles.apply:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] ClientID field, not simply ID
  clientId: api-service

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
