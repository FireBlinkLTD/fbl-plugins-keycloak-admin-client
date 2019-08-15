# Client Management

CRUD operations over `Client`.

## Get Client

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.get`
- `keycloak.client.get`

### Example

```yaml
keycloak.client.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] ClientID field, not simply ID
  clientId: api-service

  # [optional] Assign client to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignClientTo: $.ctx.client

  # [optional] Push client to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushClientTo: $.ctx.clients
```

## Create Client

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.create

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.create`
- `keycloak.client.create`

### Example

```yaml
keycloak.client.create:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Client representation
  client:
    # [required] ClientID field, not simply ID
    clientId: client-id
    # [optional] other client fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_clientrepresentation
```

## Update Client

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.update

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.update`
- `keycloak.client.update`

### Example

```yaml
keycloak.client.update:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: realm-name

  # [required] ClientID field, not simply ID
  clientId: api-service

  # [required] Client representation
  client:
    # [required] ClientID field, not simply ID
    clientId: client-id
    # [optional] other client fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_clientrepresentation
```

## Delete Client

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.delete`
- `keycloak.client.delete`

### Example

```yaml
keycloak.client.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: realm-name

  # [required] ClientID field, not simply ID
  clientId: api-service
```
