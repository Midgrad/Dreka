#include "map_layers_controller.h"

#include <QSettings>

MapLayersController::MapLayersController(QObject *parent)
    : QObject(parent), m_layers(new MapLayersModel(this)) {
  m_layers->add({"Mapbox", 0, true});
  m_layers->add({"Yandex", 0, true});
  m_layers->add({"Google", 0, false});
  m_layers->add({"Pizdabol", 0, true});
}

QAbstractItemModel *MapLayersController::layers() const { return m_layers; }
