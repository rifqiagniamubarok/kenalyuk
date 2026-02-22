# Database Seed Data

This document contains the default credentials for the seeded database.

## 🔐 Login Credentials

### Superadmin Account

- **Email**: `superadmin@kenalyuk.com`
- **Password**: `admin123`
- **Role**: SUPERADMIN
- **Status**: ACTIVE
- **Access**: Full system access, can manage regions, supervisors, and all users

### Supervisor Accounts

#### Jakarta Supervisor

- **Email**: `supervisor.jakarta@kenalyuk.com`
- **Password**: `supervisor123`
- **Role**: SUPERVISOR
- **Region**: Jakarta
- **Status**: ACTIVE

#### Medan Supervisor

- **Email**: `supervisor.medan@kenalyuk.com`
- **Password**: `supervisor123`
- **Role**: SUPERVISOR
- **Region**: Medan
- **Status**: ACTIVE

#### Yogyakarta Supervisor

- **Email**: `supervisor.yogyakarta@kenalyuk.com`
- **Password**: `supervisor123`
- **Role**: SUPERVISOR
- **Region**: Yogyakarta
- **Status**: ACTIVE

## 📍 Regions

1. **Jakarta** - DKI Jakarta - Capital city of Indonesia
2. **Medan** - North Sumatra - Third largest city in Indonesia
3. **Yogyakarta** - Daerah Istimewa Yogyakarta - Cultural heart of Java

## 🌱 Running the Seeder

To re-run the seeder and reset the database to initial state:

```bash
npm run seed
```

⚠️ **Warning**: This will delete all existing data and recreate the initial dataset.

## 🔄 Alternative: Manual Seeding

You can also run the seed file directly:

```bash
npx tsx prisma/seed.ts
```

## 📝 Notes

- All accounts are pre-verified (emailVerified is set)
- All accounts have ACTIVE status
- Supervisors are each assigned to their respective regions
- Passwords are hashed using bcrypt with 10 salt rounds
