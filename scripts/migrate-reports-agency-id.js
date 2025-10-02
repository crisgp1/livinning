// ============================================
// Script de migración: Agregar agencyId a reportes existentes
// ============================================

const { MongoClient, ObjectId } = require('mongodb');

async function migrateReports() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db('livinning');
    const reportsCollection = db.collection('reports');
    const propertiesCollection = db.collection('properties');

    // Encontrar reportes de tipo 'property' sin agencyId
    const reportsToMigrate = await reportsCollection
      .find({
        type: 'property',
        propertyId: { $exists: true },
        $or: [
          { agencyId: { $exists: false } },
          { agencyId: null }
        ]
      })
      .toArray();

    console.log(`\n📋 Encontrados ${reportsToMigrate.length} reportes para migrar`);

    let migrated = 0;
    let failed = 0;

    for (const report of reportsToMigrate) {
      try {
        // Obtener la propiedad
        const property = await propertiesCollection.findOne({
          _id: new ObjectId(report.propertyId)
        });

        if (property && property.ownerId) {
          // Actualizar el reporte con el agencyId
          await reportsCollection.updateOne(
            { _id: report._id },
            {
              $set: {
                agencyId: property.ownerId,
                agencyName: property.ownerName || 'Usuario',
                updatedAt: new Date()
              }
            }
          );

          console.log(`  ✅ Reporte ${report._id} actualizado - agencyId: ${property.ownerId}`);
          migrated++;
        } else {
          console.log(`  ⚠️  Reporte ${report._id} - Propiedad no encontrada o sin dueño`);
          failed++;
        }
      } catch (error) {
        console.error(`  ❌ Error en reporte ${report._id}:`, error.message);
        failed++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   - Migrados exitosamente: ${migrated}`);
    console.log(`   - Fallidos: ${failed}`);
    console.log(`   - Total: ${reportsToMigrate.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Conexión cerrada');
  }
}

migrateReports();
