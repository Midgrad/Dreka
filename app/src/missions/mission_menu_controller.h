#ifndef MISSION_MENU_CONTROLLER_H
#define MISSION_MENU_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionMenuController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool canGoto READ canGoto NOTIFY routeItemChanged)
    Q_PROPERTY(QVariant route READ route NOTIFY routeItemChanged)
    Q_PROPERTY(int inRouteIndex READ inRouteIndex NOTIFY routeItemChanged)

public:
    explicit MissionMenuController(QObject* parent = nullptr);

    bool canGoto() const;
    QVariant route() const;
    int inRouteIndex() const;

public slots:
    void invokeMenu(const QVariant& missionId, int index, double x, double y);
    void drop();

    void remove();
    void gotoItem();

signals:
    void routeItemChanged();
    void dropped();

    void menuInvoked(double x, double y);

private:
    domain::IMissionsService* const m_missionsService;
    domain::Mission* m_mission = nullptr;
    domain::MissionRouteItem* m_missionItem = nullptr;
};
} // namespace md::presentation

#endif // MISSION_MENU_CONTROLLER_H
