#ifndef ROUTE_ITEM_EDIT_CONTROLLER_H
#define ROUTE_ITEM_EDIT_CONTROLLER_H

#include "i_routes_service.h"

#include <QJsonArray>

namespace md::presentation
{
class RouteItemEditController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant route READ route WRITE setRoute NOTIFY routeChanged)
    Q_PROPERTY(int inRouteIndex READ inRouteIndex WRITE setInRouteIndex NOTIFY routeItemChanged)
    Q_PROPERTY(QJsonObject routeItem READ routeItem NOTIFY routeItemChanged)
    Q_PROPERTY(int routeItemsCount READ routeItemsCount NOTIFY routeChanged)
    Q_PROPERTY(QJsonArray itemTypes READ itemTypes NOTIFY routeChanged)
    Q_PROPERTY(QJsonObject itemParameters READ itemParameters NOTIFY routeItemChanged)

public:
    explicit RouteItemEditController(QObject* parent = nullptr);

    QVariant route() const;
    int inRouteIndex() const;
    QJsonObject routeItem() const;
    int routeItemsCount() const;

    QJsonArray itemTypes() const;

    QJsonObject itemParameters() const;
    Q_INVOKABLE QJsonArray typeParameters(const QString& typeId);

public slots:
    void setRoute(const QVariant& routeId);
    void setInRouteIndex(int index);

    void rename(const QString& name);
    void changeItemType(const QString& typeId);
    void setPosition(double latitude, double longitude, float altitude);
    void setParameter(const QString& parameterId, const QVariant& value);
    void remove();

signals:
    void routeChanged();
    void routeItemChanged();

private:
    domain::IRoutesService* const m_routesService;
    domain::Route* m_route = nullptr;
    domain::RouteItem* m_routeItem = nullptr;
};
} // namespace md::presentation

#endif // ROUTE_ITEM_EDIT_CONTROLLER_H
