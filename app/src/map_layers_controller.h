#ifndef MAP_LAYERS_CONTROLLER_H
#define MAP_LAYERS_CONTROLLER_H

#include "map_layers_model.h"

class MapLayersController : public QObject {
  Q_OBJECT

  Q_PROPERTY(QAbstractItemModel* layers READ layers CONSTANT)

 public:
  explicit MapLayersController(QObject* parent = nullptr);

  QAbstractItemModel* layers() const;

 private:
  MapLayersModel* const m_layers;
};

#endif  // MAP_LAYERS_CONTROLLER_H
