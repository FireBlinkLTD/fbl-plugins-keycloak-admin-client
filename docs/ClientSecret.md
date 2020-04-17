# Client Secret

Get and generate new secret actions for a client.

## Get Client's Secret

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.secret.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.secret.get`
- `keycloak.client.secret.get`

### Example

```yaml
keycloak.client.secret.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] ClientID field, not simply ID
  clientId: api-service

  # [optional] Assign client's secret to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignClientSecretTo: $.ctx.client

  # [optional] Push client's secret to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushClientSecretTo: $.ctx.clients
```

## Generate New Client's Secret

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.client.secret.generate

**Aliases:**

- `fbl.plugins.keycloak.admin.client.client.secret.generate`
- `keycloak.client.secret.generate`

### Example

```yaml
keycloak.client.secret.generate:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] ClientID field, not simply ID
  clientId: api-service
```
