#ifndef MISSIONS_CONTROLLER_H
#define MISSIONS_CONTROLLER_H

#include "i_missions_service.h"
#include "i_routes_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionsController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonArray missions READ missions NOTIFY missionsChanged)
    Q_PROPERTY(QJsonArray routes READ routes NOTIFY routesChanged)

public:
    explicit MissionsController(QObject* parent = nullptr);

    QJsonArray missions() const;
    QJsonArray routes() const;

signals:
    void missionsChanged();
    void routesChanged();

private:
    domain::IMissionsService* const m_missionsService;
    domain::IRoutesService* const m_routesService;
};
} // namespace md::presentation

#endif // MISSIONS_CONTROLLER_H
