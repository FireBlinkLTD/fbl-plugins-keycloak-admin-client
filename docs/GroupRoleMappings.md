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

## Other Actions

- [Realm Roles Mappings](./GroupRealmRoleMappings.md)
- [Client Roles Mappings](./GroupClientRoleMappings.md)
