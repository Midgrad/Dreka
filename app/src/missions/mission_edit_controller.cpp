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

    connect(m_missions, &IMissionsService::operationStarted, this,
            [this](MissionOperation* operation) {
                if (m_mission == operation->mission())
                {
                    if (m_operation)
                        disconnect(m_operation, nullptr, this, nullptr);

                    m_operation = operation;

                    if (m_operation)
                        connect(m_operation, &MissionOperation::changed, this,
                                &MissionEditController::operationProgressChanged);

                    emit operationProgressChanged();
                }
            });
    connect(m_missions, &IMissionsService::operationEnded, this,
            [this](MissionOperation* operation) {
                if (m_operation == operation)
                {
                    disconnect(m_operation, nullptr, this, nullptr);
                    m_operation = nullptr;

                    emit operationProgressChanged();
                }
            });
}

QVariant MissionEditController::missionId() const
{
    return m_mission ? m_mission->id() : QVariant();
}

QVariant MissionEditController::mission() const
{
    return m_mission ? m_mission->toVariantMap() : QVariant();
}

int MissionEditController::operationProgress() const
{
    if (!m_operation)
        return -1;

    return m_operation->progress * 100.0 / m_operation->total;
}

void MissionEditController::selectMission(const QVariant& missionId)
{
    Mission* mission = m_missions->mission(missionId);
    if (m_mission == mission)
        return;

    if (m_mission)
    {
        disconnect(m_mission, nullptr, this, nullptr);
    }

    m_mission = mission;

    if (m_mission)
    {
        connect(m_mission, &Mission::changed, this, &MissionEditController::missionChanged);
    }

    emit missionChanged();
}

void MissionEditController::assignVehicle(const QVariant& vehicleId)
{
}

void MissionEditController::upload()
{
    if (!m_mission)
        return;

    m_missions->startOperation(m_mission, MissionOperation::Upload);
}

void MissionEditController::download()
{
    if (!m_mission)
        return;

    m_missions->startOperation(m_mission, MissionOperation::Download);
}

void MissionEditController::clear()
{
    if (!m_mission)
        return;

    m_missions->startOperation(m_mission, MissionOperation::Clear);
}

void MissionEditController::cancel()
{
    if (!m_operation)
        return;

    m_missions->endOperation(m_operation, MissionOperation::Canceled);
}
