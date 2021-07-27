#ifndef MAP_LAYERS_MODEL_H
#define MAP_LAYERS_MODEL_H

#include <QAbstractListModel>

struct MapLayer {
  QString name;
  int order = 0;
  bool visibility = true;
};

class MapLayersModel : public QAbstractListModel {
  Q_OBJECT

 public:
  enum MapLayersRoles {
    NameRole = Qt::UserRole + 1,
    OrderRole,
    VisibilityRole,
  };

  explicit MapLayersModel(QObject* parent = nullptr);

  int rowCount(const QModelIndex& parent = QModelIndex()) const override;
  QVariant data(const QModelIndex& index, int role) const override;

  QHash<int, QByteArray> roleNames() const override;

 public slots:
  void add(const MapLayer& layer);
  // void remove(const MapLayer& layer);
  void remove(int row);

 private:
  QList<MapLayer> m_layers;
};

#endif  // MAP_LAYERS_MODEL_H
