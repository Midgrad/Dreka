#ifndef MAP_MENU_CONTROLLER_H
#define MAP_MENU_CONTROLLER_H

#include <QObject>

namespace md::presentation
{
class MapMenuController : public QObject
{
    Q_OBJECT

public:
    explicit MapMenuController(QObject* parent = nullptr);

signals:
    Q_INVOKABLE void invoke(double latitude, double longitude, float altitude);
};
} // namespace md::presentation

#endif // MAP_MENU_CONTROLLER_H
