# Group Management

CRUD operations over `Group`.

## Get Group

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.get`
- `keycloak.group.get`

### Example

```yaml
keycloak.group.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

  # [optional] Assign group to context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignGroupTo: $.ctx.group

  # [optional] Push group to context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushGroupTo: $.ctx.groups
```

## Create Group

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.create

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.create`
- `keycloak.group.create`

### Example

```yaml
keycloak.group.create:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group representation
  group:
    # [required] Group name
    name: admins
    # [optional] other group fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_grouprepresentation
    # Note: `clientRoles` and `realmRoles` have no affect upon creation and will be ignored
```

## Update Group

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.update

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.update`
- `keycloak.group.update`

### Example

```yaml
keycloak.group.update:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name to update
  realmName: realm-name

  # [required] Group name
  groupName: admins

  # [required] Group representation
  group:
    # [required] Group name
    name: super-admins
    # [optional] other group fields - https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_grouprepresentation
    # Note: `clientRoles` and `realmRoles` have no affect upon creation and will be ignored
```

## Delete Group

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.delete`
- `keycloak.group.delete`

### Example

```yaml
keycloak.group.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name to delete
  realmName: realm-name

  # [required] Group name
  groupName: admins
```
