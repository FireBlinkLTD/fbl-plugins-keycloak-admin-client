# Client Role Management

CRUD operations over `Client roles`.

# Get Client Role

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.role.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.role.get`
- `keycloak.client.role.get`

## Example

```yaml
keycloak.client.role.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] ClientID field, not simply ID
  clientId: api-service

  # [required] Client role name
  roleName: role

  # [optional] Assign role to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignRoleTo: $.ctx.client

  # [optional] Push role to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushRoleTo: $.ctx.clients
```

## Create Client Role

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.role.create

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.role.create`
- `keycloak.client.role.create`

## Example

```yaml
keycloak.client.role.create:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] ClientID field, not simply ID
  clientId: client-id

  # [required] Client representation
  role:
    # [required] Role name
    name: role-name
    # [optional] other client fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_rolerepresentation
```

## Update Client Role

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.role.update

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.role.update`
- `keycloak.client.role.update`

## Example

```yaml
keycloak.client.role.update:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name to update
  realmName: realm-name

  # [required] ClientID field, not simply ID
  clientId: api-service

  # [required] Client role name
  roleName: role

  # [required] Client representation
  role:
    # [required] Role name
    name: role-name
    # [optional] other client fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_rolerepresentation
```

## Delete Client Role

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.role.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.role.delete`
- `keycloak.client.role.delete`

## Example

```yaml
keycloak.client.role.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name to delete
  realmName: realm-name

  # [required] ClientID field, not simply ID
  clientId: api-service

  # [required] Client role name
  roleName: role
```
