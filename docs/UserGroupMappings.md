# User Group Mappings

Assign/unassign users to/from groups.

## Add User to Group

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.groups.add

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.groups.add`
- `keycloak.user.groups.add`

### Example

```yaml
keycloak.user.groups.add:
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

  # [required] Group name
  groupName: admins
```

## Remove User from Group

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.groups.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.groups.delete`
- `keycloak.user.groups.delete`

### Example

```yaml
keycloak.user.groups.delete:
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

  # [required] Group name
  groupName: admins
```

## Get User Groups

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.groups.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.groups.get`
- `keycloak.user.groups.get`

### Example

```yaml
keycloak.user.groups.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: realm-name

  # [optional] User name
  # Note: either username or email field is required
  username: admin

  # [optional] User email
  # Note: either username or email field is required
  email: admin@fireblink.com

  # [optional] Assign group names to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignGroupsTo: $.ctx.group

  # [optional] Push group names to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushGroupsTo: $.ctx.groups
```
