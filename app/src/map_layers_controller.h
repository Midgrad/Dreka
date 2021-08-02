#ifndef MAP_LAYERS_CONTROLLER_H
#define MAP_LAYERS_CONTROLLER_H

#include <QJsonArray>
#include <QObject>

class MapLayersController : public QObject {
  Q_OBJECT

  Q_PROPERTY(QJsonArray layers READ layers NOTIFY layersChanged)

 public:
  explicit MapLayersController(QObject* parent = nullptr);

  QJsonArray layers() const;

 public slots:
  void save();
  void restore();
  void toggleVisibility(const QString& name);

 signals:
  void layersChanged();

 private:
  QJsonArray m_layers;
};

#endif  // MAP_LAYERS_CONTROLLER_H
