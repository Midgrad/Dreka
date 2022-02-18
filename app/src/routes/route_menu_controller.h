#ifndef ROUTE_MENU_CONTROLLER_H
#define ROUTE_MENU_CONTROLLER_H

#include "i_routes_service.h"

#include <QJsonArray>

namespace md::presentation
{
class RouteMenuController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool canGoto READ canGoto NOTIFY routeItemChanged)
    Q_PROPERTY(QVariant route READ route NOTIFY routeItemChanged)
    Q_PROPERTY(int inRouteIndex READ inRouteIndex NOTIFY routeItemChanged)

public:
    explicit RouteMenuController(QObject* parent = nullptr);

    bool canGoto() const;
    QVariant route() const;
    int inRouteIndex() const;

public slots:
    void invokeMenu(const QVariant& routeId, int index, double x, double y);
    void drop();

    void remove();
    void gotoItem();

signals:
    void routeItemChanged();
    void dropped();

    void menuInvoked(double x, double y);

private:
    domain::IRoutesService* const m_routesService;
    domain::Route* m_route = nullptr;
    domain::RouteItem* m_routeItem = nullptr;
};
} // namespace md::presentation

#endif // ROUTE_MENU_CONTROLLER_H
