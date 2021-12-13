#ifndef WAYPOINT_CONTROLLER_H
#define WAYPOINT_CONTROLLER_H

#include "i_routes_service.h"

#include <QJsonArray>

namespace md::presentation
{
class RouteItemController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonObject waypoint READ waypoint NOTIFY waypointChanged)
    Q_PROPERTY(int waypointIndex READ waypointIndex NOTIFY waypointChanged)
    Q_PROPERTY(int waypointsCount READ waypointsCount NOTIFY routeChanged)
    Q_PROPERTY(QJsonArray waypointTypes READ waypointTypes NOTIFY routeChanged)
    Q_PROPERTY(QJsonObject waypointParameters READ waypointParameters NOTIFY waypointChanged)

public:
    explicit RouteItemController(QObject* parent = nullptr);

    QJsonObject waypoint() const;
    int waypointIndex() const;
    int waypointsCount() const;

    QJsonArray waypointTypes() const;

    QJsonObject waypointParameters() const;
    Q_INVOKABLE QJsonArray typeParameters(const QString& typeId);

public slots:
    void invokeWaypointMenu(const QVariant& routeId, int index, double x, double y);
    void setWaypoint(const QVariant& routeId, int index);
    void setWaypointIndex(int index);
    void setCurrentWaypointSelected(bool selected);
    void updatePopupPosition(double x, double y);

    void renameWaypoint(const QString& name);
    void changeWaypointItemType(const QString& typeId);
    void setPosition(double latitude, double longitude, float altitude);
    void setWaypointParameter(const QString& parameterId, const QVariant& value);
    void removeWaypoint();

signals:
    void waypointChanged();
    void routeChanged();

    void centerWaypoint(QVariant routeId, int index);
    void closeEditor();
    void updatePosition(double x, double y);
    void invokeMenu(double x, double y);
    void setWaypointSelected(QVariant routeId, int index, bool opened);

private:
    domain::IRoutesService* const m_routesService;
    domain::Route* m_route = nullptr;
    domain::RouteItem* m_waypoint = nullptr;
};
} // namespace md::presentation

#endif // WAYPOINT_CONTROLLER_H
