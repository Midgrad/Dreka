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
                if (m_missionId == operation->mission()->id())
                    this->setOperation(operation);
            });
    connect(m_missionsService, &IMissionsService::operationEnded, this,
            [this](MissionOperation* operation) {
                if (m_operation == operation)
                    this->setOperation(nullptr);
                m_missionId = QVariant();
            });
}

QJsonObject MissionOperationController::operation() const
{
    if (!m_operation)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_operation->toVariantMap());
}

void MissionOperationController::upload(const QVariant& missionId)
{
    this->startOperation(missionId, MissionOperation::Upload);
}

void MissionOperationController::download(const QVariant& missionId)
{
    this->startOperation(missionId, MissionOperation::Download);
}

void MissionOperationController::clear(const QVariant& missionId)
{
    this->startOperation(missionId, MissionOperation::Clear);
}

void MissionOperationController::cancel(const QVariant& missionId)
{
    Q_UNUSED(missionId) // For future uses

    if (!m_operation)
        return;

    m_missionsService->endOperation(m_operation, MissionOperation::Canceled);
}

void MissionOperationController::startOperation(const QVariant& missionId,
                                                domain::MissionOperation::Type type)
{
    domain::Mission* mission = m_missionsService->mission(missionId);
    if (!mission)
        return;

    m_missionId = missionId;
    m_missionsService->startOperation(mission, type);
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
