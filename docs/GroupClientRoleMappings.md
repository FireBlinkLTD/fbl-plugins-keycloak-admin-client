# Group Clients Roles Mappings

Modify client roles group mappings.

## Add Client Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.client.roles.add

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.client.roles.add`
- `keycloak.group.mappings.client.roles.add`

### Example

```yaml
keycloak.group.mappings.client.roles.add:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

  # [required] client roles mappings to add
  clientRoles:
    clientId-1:
      - a
      - b
    clientId-2:
      - d
```

## Delete Client Role Mappings

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.client.roles.delete

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.client.roles.delete`
- `keycloak.group.mappings.client.roles.delete`

### Example

```yaml
keycloak.group.mappings.client.roles.delete:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

  # [required] List of client roles to unassign
  clientRoles:
    clientId-1:
      - a
    clientId-2:
      - d
```

## Apply Client Role Mappings

This action will make sure group has only listed client roles mappings for provided clients.

Note: if you want to unassign all roles for one client just provide empty list of roles for that client.

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.group.mappings.client.roles.apply

**Aliases:**

- `fbl.plugins.keycloak.admin.client.group.mappings.client.roles.apply`
- `keycloak.group.mappings.client.roles.apply`

### Example

```yaml
keycloak.group.mappings.client.roles.apply:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Group name
  groupName: admins

  # [required] List of client roles to be mapped
  clientRoles:
    clientId-1: [] # Unassign all roles
    clientId-2:
      - d
      - e
```
