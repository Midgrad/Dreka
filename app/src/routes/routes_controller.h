#ifndef ROUTES_CONTROLLER_H
#define ROUTES_CONTROLLER_H

#include "i_missions_service.h"
#include "i_routes_service.h"

#include <QJsonArray>

namespace md::presentation
{
class RoutesController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonArray routeTypes READ routeTypes NOTIFY routeTypesChanged)
    Q_PROPERTY(QVariantList routeIds READ routeIds NOTIFY routeIdsChanged)
    // TODO: selectedRoute to QML only
    Q_PROPERTY(QVariant selectedRoute READ selectedRoute NOTIFY selectedRouteChanged)

public:
    explicit RoutesController(QObject* parent = nullptr);

    QJsonArray routeTypes() const;
    QVariantList routeIds() const;
    QVariant selectedRoute() const;

    Q_INVOKABLE QJsonObject routeData(const QVariant& routeId) const;
    Q_INVOKABLE QJsonObject routeItemData(const QVariant& routeId, int index) const;
    Q_INVOKABLE QJsonArray routeItemTypes(const QVariant& routeId) const;

public slots:
    void selectRoute(const QVariant& selectedRouteId);
    void addNewRoute(const QString& routeTypeId);
    void updateRoute(const QVariant& routeId, const QJsonObject& data);
    void renameRoute(const QVariant& routeId, const QString& name);
    void removeRoute(const QVariant& routeId);
    void addRouteItem(const QVariant& routeId, const QString& typeId, const QVariantMap& position);
    void updateRouteItemData(const QVariant& routeId, int index, const QJsonObject& data);
    void setRouteItemCalcParam(const QVariant& routeId, int index, const QString& key,
                               const QVariant& value);

signals:
    void routeTypesChanged();
    void routeIdsChanged();
    void selectedRouteChanged(QVariant routeId);

    void routeAdded(QVariant routeId);
    void routeRemoved(QVariant routeId);
    void routeChanged(QVariant routeId);

    void routeItemAdded(QVariant routeId, int index);
    void routeItemRemoved(QVariant routeId, int index);
    void routeItemChanged(QVariant routeId, int index);

    void centerRoute(QVariant routeId);
    void centerRouteItem(QVariant routeId, int index);

private slots:
    void onRouteAdded(domain::Route* route);
    void onRouteRemoved(domain::Route* route);

private:
    domain::IRoutesService* const m_routesService;

    domain::Route* m_selectedRoute = nullptr;
};
} // namespace md::presentation

#endif // ROUTES_CONTROLLER_H
