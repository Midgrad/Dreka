#include "map_layers_model.h"

MapLayersModel::MapLayersModel(QObject *parent) : QAbstractListModel(parent) {}

int MapLayersModel::rowCount(const QModelIndex &parent) const {
  return m_layers.count();
}

QVariant MapLayersModel::data(const QModelIndex &index, int role) const {
  if (!index.isValid() || index.row() >= m_layers.count()) return QVariant();

  MapLayer layer = m_layers.at(index.row());

  switch (role) {
    case NameRole:
      return layer.name;
    case OrderRole:
      return layer.name;
    case VisibilityRole:
      return layer.visibility;
  }
  return QVariant();
}

QHash<int, QByteArray> MapLayersModel::roleNames() const {
  QHash<int, QByteArray> roles;

  roles[NameRole] = "name";
  roles[OrderRole] = "order";
  roles[VisibilityRole] = "visibility";

  return roles;
}

void MapLayersModel::add(const MapLayer &layer) {
  this->beginInsertRows(QModelIndex(), this->rowCount(), this->rowCount());
  m_layers.append(layer);
  this->endInsertRows();
}

// void MapLayersModel::remove(const MapLayer &layer) {
//  int row = m_layers.indexOf(layer);
//  if (row == -1) return;

//  this->remove(row);
//}

void MapLayersModel::remove(int row) {
  this->beginRemoveRows(QModelIndex(), row, row);
  m_layers.removeAt(row);
  this->endRemoveRows();
}
