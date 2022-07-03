#include "missions_menu_controller.h"

#include <QDebug>

#include "locator.h"
#include "mission_traits.h"

using namespace md::domain;
using namespace md::presentation;

MissionsMenuController::MissionsMenuController(QObject* parent) :
    QObject(parent),
    m_missionsService(md::app::Locator::get<IMissionsService>())
{
    connect(m_missionsService, &IMissionsService::missionRemoved, this, [this](Mission* mission) {
        if (m_mission != mission)
            return;

        m_mission = nullptr;
        m_missionItem = nullptr;
        emit changed();
    });
}

bool MissionsMenuController::canGoto() const
{
    return m_mission && m_missionItem && !m_missionItem->current();
}

QVariant MissionsMenuController::mission() const
{
    return m_mission ? m_mission->id() : QVariant();
}

int MissionsMenuController::inRouteIndex() const
{
    if (!m_mission || !m_missionItem)
        return -1;

    return m_mission->route()->index(m_missionItem);
}

void MissionsMenuController::invokeMenu(const QVariant& missionId, int index, double x, double y)
{
    m_mission = m_missionsService->mission(missionId);
    m_missionItem = m_mission ? m_mission->route()->item(index) : nullptr;

    emit changed();

    if (m_missionItem)
        emit menuInvoked(x, y);
}

void MissionsMenuController::drop()
{
    emit dropped();
}

void MissionsMenuController::remove()
{
    if (!m_mission || !m_missionItem)
        return;

    m_mission->route()->removeItem(m_missionItem);
    m_missionsService->saveMission(m_mission);
}

void MissionsMenuController::gotoItem()
{
    if (!m_missionItem)
        return;

    emit m_missionItem->goTo();
}
