#ifndef MISSIONS_MENU_CONTROLLER_H
#define MISSIONS_MENU_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionsMenuController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool canGoto READ canGoto NOTIFY changed)
    Q_PROPERTY(QVariant mission READ mission NOTIFY changed)
    Q_PROPERTY(int inRouteIndex READ inRouteIndex NOTIFY changed)

public:
    explicit MissionsMenuController(QObject* parent = nullptr);

    bool canGoto() const;
    QVariant mission() const;
    int inRouteIndex() const;

public slots:
    void invokeMenu(const QVariant& missionId, int index, double x, double y);
    void drop();

    void remove();
    void gotoItem();

signals:
    void changed();
    void dropped();

    void menuInvoked(double x, double y);

private:
    domain::IMissionsService* const m_missionsService;
    domain::Mission* m_mission = nullptr;
    domain::MissionRouteItem* m_missionItem = nullptr;
};
} // namespace md::presentation

#endif // MISSIONS_MENU_CONTROLLER_H
