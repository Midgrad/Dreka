#ifndef MISSION_ROUTE_CONTROLLER_H
#define MISSION_ROUTE_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionRouteController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant missionId READ missionId WRITE selectMission NOTIFY missionChanged)
    Q_PROPERTY(QJsonArray routeItems READ routeItems NOTIFY routeItemsChanged)
    Q_PROPERTY(int count READ count NOTIFY routeItemsChanged)

public:
    explicit MissionRouteController(QObject* parent = nullptr);

    QVariant missionId() const;
    QJsonArray routeItems() const;
    int count() const;

public slots:
    void selectMission(const QVariant& missionId);

signals:
    void missionChanged();
    void routeItemsChanged();
    void selectItem(int index);

private:
    domain::IMissionsService* const m_missions;
    domain::Mission* m_mission = nullptr;
};
} // namespace md::presentation

#endif // MISSION_ROUTE_CONTROLLER_H
