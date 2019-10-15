# User Realm Roles Mappings

Modify Realm roles user mappings.

## Add Realm Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.realm.roles.add

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.realm.roles.add`
- `keycloak.user.mappings.realm.roles.add`

### Example

```yaml
keycloak.user.mappings.realm.roles.add:
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

  # [required] List of realm roles to add
  realmRoles:
    - admin
```

## Delete Realm Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.realm.roles.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.realm.roles.delete`
- `keycloak.user.mappings.realm.roles.delete`

### Example

```yaml
keycloak.user.mappings.realm.roles.delete:
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

  # [required] List of realm roles to unassign
  realmRoles:
    - admin
```

## Apply Realm Role Mappings

This action will make sure user has only listed realm roles mappings.

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.user.mappings.realm.roles.apply

**Aliases:**

- `fbl.plugins.keycloak.admin.client.user.mappings.realm.roles.apply`
- `keycloak.user.mappings.realm.roles.apply`

### Example

```yaml
keycloak.user.mappings.realm.roles.apply:
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

  # [required] List of realm roles to be mapped
  realmRoles:
    - admin
```
