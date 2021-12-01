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

public slots:
    void invoke(int x, int y, double latitude, double longitude, float altitude);

signals:
    void invoked(int x, int y, double latitude, double longitude, float altitude);
};
} // namespace md::presentation

#endif // MAP_MENU_CONTROLLER_H
