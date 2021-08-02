#include "map_layers_controller.h"

#include <QDebug>
#include <QFile>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonObject>

namespace {
constexpr char name[] = "name";
constexpr char type[] = "type";
constexpr char url[] = "url";
constexpr char visibility[] = "visibility";
constexpr char opacity[] = "opacity";

constexpr char path[] = "./layers.json";
}  // namespace

MapLayersController::MapLayersController(QObject* parent) : QObject(parent) {}

QJsonArray MapLayersController::layers() const { return m_layers; }

void MapLayersController::save() {
  QFile file(::path);
  file.open(QFile::WriteOnly | QFile::Text | QFile::Truncate);

  QJsonDocument doc(m_layers);
  file.write(doc.toJson());
  file.close();
}

void MapLayersController::restore() {
  QFile file(::path);
  file.open(QIODevice::ReadOnly | QIODevice::Text);

  QJsonDocument doc = QJsonDocument::fromJson(file.readAll());
  file.close();

  m_layers = doc.array();
  emit layersChanged();
}

void MapLayersController::toggleVisibility(const QString& name) {
  QJsonArray newLayers;

  for (const QJsonValue& value : qAsConst(m_layers)) {
    auto object = value.toObject();

    if (object.value(::name) == name) {
      object[::visibility] = true;
    } else {
      object[::visibility] = false;
    }
    newLayers.append(object);
  }

  m_layers = newLayers;
  emit layersChanged();
}
