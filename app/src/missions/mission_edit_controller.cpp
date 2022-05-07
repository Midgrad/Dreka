#include "mission_edit_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionEditController::MissionEditController(QObject* parent) :
    QObject(parent),
    m_missions(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missions);
}

QVariant MissionEditController::missionId() const
{
    return m_mission ? m_mission->id() : QVariant();
}

QVariant MissionEditController::operation() const
{
    return m_operation ? m_operation->toVariantMap() : QVariant();
}

void MissionEditController::selectMission(const QVariant& missionId)
{
    Mission* mission = m_missions->mission(missionId);
    if (m_mission == mission)
        return;

    m_mission = mission;
    emit missionChanged();
}

void MissionEditController::upload()
{
}

void MissionEditController::download()
{
}

void MissionEditController::clear()
{
}

void MissionEditController::cancel()
{
    if (!m_operation)
        return;

    m_missions->endOperation(m_operation, MissionOperation::Canceled);
}
