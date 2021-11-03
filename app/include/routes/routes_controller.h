#ifndef ROUTES_CONTROLLER_H
#define ROUTES_CONTROLLER_H

#include "i_missions_repository.h"
#include "i_routes_repository.h"

namespace md::presentation
{
class RoutesController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QStringList routeTypes READ routeTypes NOTIFY routeTypesChanged)
    Q_PROPERTY(QVariantList routeIds READ routeIds NOTIFY routeIdsChanged)
    Q_PROPERTY(QVariant selectedRoute READ selectedRoute NOTIFY selectedRouteChanged)

public:
    explicit RoutesController(QObject* parent = nullptr);

    QStringList routeTypes() const;
    QVariantList routeIds() const;
    QVariant selectedRoute() const;

    Q_INVOKABLE QJsonObject routeData(const QVariant& routeId) const;
    Q_INVOKABLE QJsonObject waypointData(const QVariant& routeId, int index) const;

public slots:
    Q_INVOKABLE void setActiveMission(const QVariant& missionId);
    void selectRoute(const QVariant& selectedRouteId);
    void addNewRoute(const QString& routeType);
    void updateRoute(const QVariant& routeId, const QJsonObject& data);
    void removeRoute(const QVariant& routeId);
    void updateWaypoint(const QVariant& routeId, int index, const QJsonObject& data);
    void removeWaypoint(const QVariant& routeId, int index);

signals:
    void routeTypesChanged();
    void routeIdsChanged();
    void selectedRouteChanged(QVariant routeId);

    void routeAdded(QVariant routeId);
    void routeRemoved(QVariant routeId);
    void routeChanged(QVariant routeId);

    void waypointAdded(QVariant routeId, int index);
    void waypointRemoved(QVariant routeId, int index);
    void waypointChanged(QVariant routeId, int index);

    void centerRoute(QVariant routeId);
    void centerWaypoint(QVariant routeId, int index);

private slots:
    void onRouteAdded(domain::Route* route);
    void onRouteRemoved(domain::Route* route);

private:
    domain::IRoutesRepository* const m_routesRepository;
    domain::IMissionsRepository* const m_missionsRepository;
    domain::Mission* m_activeMission = nullptr;
    domain::Route* m_selectedRoute = nullptr;
};
} // namespace md::presentation

#endif // ROUTES_CONTROLLER_H
