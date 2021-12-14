#ifndef ROUTE_ITEM_CONTROLLER_H
#define ROUTE_ITEM_CONTROLLER_H

#include "i_routes_service.h"

#include <QJsonArray>

namespace md::presentation
{
class RouteItemController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonObject routeItem READ routeItem NOTIFY routeItemChanged)
    Q_PROPERTY(int inRouteIndex READ inRouteIndex NOTIFY routeItemChanged)
    Q_PROPERTY(int routeItemsCount READ routeItemsCount NOTIFY routeChanged)
    Q_PROPERTY(QJsonArray itemTypes READ itemTypes NOTIFY routeChanged)
    Q_PROPERTY(QJsonObject itemParameters READ itemParameters NOTIFY routeItemChanged)

public:
    explicit RouteItemController(QObject* parent = nullptr);

    QJsonObject routeItem() const;
    int inRouteIndex() const;
    int routeItemsCount() const;

    QJsonArray itemTypes() const;

    QJsonObject itemParameters() const;
    Q_INVOKABLE QJsonArray typeParameters(const QString& typeId);

public slots:
    void invokeMenu(const QVariant& routeId, int index, double x, double y);
    void setRouteItem(const QVariant& routeId, int index);
    void setIndex(int index);
    void updatePopupPosition(double x, double y);

    void rename(const QString& name);
    void changeItemType(const QString& typeId);
    void setPosition(double latitude, double longitude, float altitude);
    void setParameter(const QString& parameterId, const QVariant& value);
    void remove();

signals:
    void routeItemChanged();
    void routeChanged();

    void centerRouteItem(QVariant routeId, int index);
    void closeEditor();
    void updatePosition(double x, double y);
    void menuInvoked(double x, double y);
    void itemSelected(QVariant routeId, int index);

private:
    domain::IRoutesService* const m_routesService;
    domain::Route* m_route = nullptr;
    domain::RouteItem* m_routeItem = nullptr;
};
} // namespace md::presentation

#endif // ROUTE_ITEM_CONTROLLER_H
