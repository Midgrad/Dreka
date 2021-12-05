#include "mission_operation_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionOperationController::MissionOperationController(QObject* parent) :
    QObject(parent),
    m_missionsService(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missionsService);

    connect(m_missionsService, &IMissionsService::operationStarted, this,
            [this](MissionOperation* operation) {
                if (m_mission && m_mission == operation->mission())
                    this->setOperation(operation);
            });
    connect(m_missionsService, &IMissionsService::operationEnded, this,
            [this](MissionOperation* operation) {
                if (m_operation == operation)
                    this->setOperation(nullptr);
            });
}

QVariant MissionOperationController::missionId() const
{
    if (!m_mission)
        return QVariant();

    return m_mission->id;
}

QJsonObject MissionOperationController::mission() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->toVariantMap());
}

QJsonObject MissionOperationController::operation() const
{
    if (!m_operation)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_operation->toVariantMap());
}

void MissionOperationController::setMissionId(const QVariant& missionId)
{
    this->setMission(m_missionsService->mission(missionId));
}

void MissionOperationController::setMission(Mission* mission)
{
    if (m_mission == mission)
        return;

    m_mission = mission;
    m_operation = m_missionsService->operationForMission(mission);

    emit missionChanged();
    emit operationChanged();
}

void MissionOperationController::save(const QJsonObject& data)
{
    if (!m_mission)
        return;

    m_mission->fromVariantMap(data.toVariantMap());
    m_missionsService->saveMission(m_mission);
}

void MissionOperationController::remove()
{
    if (!m_mission)
        return;

    m_missionsService->removeMission(m_mission);
}

void MissionOperationController::upload()
{
    if (!m_mission)
        return;

    m_missionsService->startOperation(m_mission, MissionOperation::Upload);
}

void MissionOperationController::download()
{
    if (!m_mission)
        return;

    m_missionsService->startOperation(m_mission, MissionOperation::Download);
}

void MissionOperationController::clear()
{
    if (!m_mission)
        return;

    m_missionsService->startOperation(m_mission, MissionOperation::Clear);
}

void MissionOperationController::cancel()
{
    if (!m_operation)
        return;

    m_missionsService->endOperation(m_operation);
}

void MissionOperationController::setOperation(domain::MissionOperation* operation)
{
    if (m_operation == operation)
        return;

    if (m_operation)
        disconnect(m_operation, nullptr, this, nullptr);

    m_operation = operation;

    if (m_operation)
        connect(m_operation, &MissionOperation::changed, this,
                &MissionOperationController::operationChanged);

    emit operationChanged();
}
