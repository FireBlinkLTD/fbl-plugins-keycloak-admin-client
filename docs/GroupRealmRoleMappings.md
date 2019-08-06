# Group Realm Roles Mappings

Modify Realm roles group mappings.

## Add Realm Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.realm.roles.add

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.realm.roles.add`
- `keycloak.group.mappings.realm.roles.add`

### Example

```yaml
keycloak.group.mappings.realm.roles.add:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

  # [required] List of realm roles to add
  realmRoles:
    - admin
```

## Delete Realm Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.realm.roles.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.realm.roles.delete`
- `keycloak.group.mappings.realm.roles.delete`

### Example

```yaml
keycloak.group.mappings.realm.roles.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

  # [required] List of realm roles to unassign
  realmRoles:
    - admin
```

## Apply Realm Role Mappings

This action will make sure group has only listed realm roles mappings.

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.realm.roles.apply

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.realm.roles.apply`
- `keycloak.group.mappings.realm.roles.apply`

### Example

```yaml
keycloak.group.mappings.realm.roles.apply:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

  # [required] List of realm roles to be mapped
  realmRoles:
    - admin
```
