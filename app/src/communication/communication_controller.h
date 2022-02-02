#ifndef COMMUNICATION_CONTROLLER_H
#define COMMUNICATION_CONTROLLER_H

#include <QObject>

#include "communication_service.h"

namespace md::presentation
{
class CommunicationController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(domain::CommunicationDescription* links READ communicationDescriptions)

public:
    explicit CommunicationController(QObject* parent = nullptr);
    ~CommunicationController() override = default;

    QList<domain::CommunicationDescription*> communicationDescriptions();

private:
    app::CommunicationService* const m_communicationService;
};
} // namespace md::presentation
#endif //COMMUNICATION_CONTROLLER_H
