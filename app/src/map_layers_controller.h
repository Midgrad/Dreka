#ifndef MAP_LAYERS_CONTROLLER_H
#define MAP_LAYERS_CONTROLLER_H

#include "map_layers_model.h"

class MapLayersController : public QObject {
  Q_OBJECT

 public:
  explicit MapLayersController(QObject* parent = nullptr);
};

#endif  // MAP_LAYERS_CONTROLLER_H
