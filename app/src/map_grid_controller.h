#ifndef MAP_GRID_CONTROLLER_H
#define MAP_GRID_CONTROLLER_H

#include <QObject>

namespace md::presentation
{
class MapGridController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool enabled MEMBER enabled NOTIFY enabledChanged)

public:
    explicit MapGridController(QObject* parent = nullptr);

    bool enabled = false;

signals:
    void enabledChanged();
};
} // namespace dreka::presentation

#endif // MAP_GRID_CONTROLLER_H
