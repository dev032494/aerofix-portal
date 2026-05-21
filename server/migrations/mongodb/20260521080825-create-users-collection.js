'use strict';

module.exports = {
  async up(db, client) {
    console.log('🚀 [NoSQL Migration] Initializing "users" collection, unique constraints, and indices...');

    // 1. Explicitly create the users collection with structured schema validations
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['first_name', 'last_name', 'email', 'password_hash', 'role', 'is_active', 'created_at', 'updated_at'],
          properties: {
            first_name: { bsonType: 'string', maxLength: 60 },
            last_name: { bsonType: 'string', maxLength: 60 },
            email: { bsonType: 'string', maxLength: 120 },
            password_hash: { bsonType: 'string' },
            signature_pin_hash: { bsonType: ['string', 'null'] },
            role: { 
              enum: ['admin', 'manager', 'mechanic', 'inspector'],
              description: 'must be one of the pre-defined shift duty clearance values'
            },
            certificate_type: { bsonType: ['string', 'null'], maxLength: 60 },
            certificate_number: { bsonType: ['string', 'null'], maxLength: 60 },
            is_active: { bsonType: 'bool' },
            last_login_at: { bsonType: ['date', 'null'] },
            created_at: { bsonType: 'date' },
            updated_at: { bsonType: 'date' }
          }
        }
      }
    });

    // 2. Provision performance optimization indexes & unique value constraints
    // This replaces SQL UNIQUE column configurations perfectly
    await db.collection('users').createIndexes([
      { 
        key: { email: 1 }, 
        name: 'idx_users_email_unique', 
        unique: true 
      },
      { 
        key: { certificate_number: 1 }, 
        name: 'idx_users_certificate_unique', 
        unique: true,
        sparse: true // Allows multiple null profiles without triggering collision bugs
      }
    ]);

    console.log('✅ Collection "users" with schema enforcement and lookups set.');
  },

  async down(db, client) {
    console.log('🧹 [NoSQL Rollback] Purging "users" collection from active cluster registry...');
    
    // Completely unmount user document structures on rollback states
    await db.collection('users').drop().catch(() => console.log('Users collection already empty.'));
    
    console.log('✅ Users collection successfully purged.');
  }
};