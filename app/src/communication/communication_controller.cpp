#include "communication_controller.h"

#include "locator.h"

using namespace md::presentation;

CommunicationController::CommunicationController(QObject* parent) :
    m_communicationService(app::Locator::get<app::CommunicationService>())
{
    Q_ASSERT(m_communicationService);
}

QList<md::domain::CommunicationDescription*> CommunicationController::communicationDescriptions()
{
    return m_communicationService->communicationDescriptions();
}
