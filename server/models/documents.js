module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    document_type: {
      type: DataTypes.STRING(20), // AMM, IPC, TSM, WDM
      allowNull: false
    },
    aircraft_types: {
      type: DataTypes.STRING, // Store string format e.g: "A318, A319, A320, A321"
      allowNull: false
    },
    customization: {
      type: DataTypes.STRING(50), // e.g., DEMO
      defaultValue: 'DEFAULT'
    },
    revision_date: {
      type: DataTypes.STRING(30), // Formatted tracking string e.g: "01-Aug-2017"
      allowNull: false
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'documents',
    timestamps: true,
    underscored: true
  });

  return Document;
};