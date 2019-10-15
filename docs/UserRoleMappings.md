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

## Other Actions

- [Realm Roles Mappings](./UserRealmRoleMappings.md)
- [Client Roles Mappings](./UserClientRoleMappings.md)
