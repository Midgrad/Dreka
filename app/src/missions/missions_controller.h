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
    Q_PROPERTY(QJsonObject selectedMission READ selectedMission NOTIFY selectedMissionChanged)
    Q_PROPERTY(QJsonArray routes READ routes NOTIFY routesChanged)

public:
    explicit MissionsController(QObject* parent = nullptr);

    QJsonArray missions() const;
    QJsonObject selectedMission() const;
    QJsonArray routes() const;

public slots:
    void selectMission(const QVariant& missionId);
    void assignRoute(const QVariant& routeId);
    void rename(const QString& name);
    void remove();

signals:
    void missionsChanged();
    void selectedMissionChanged();
    void routesChanged();

private:
    domain::IMissionsService* const m_missionsService;
    domain::IRoutesService* const m_routesService;
    domain::Mission* m_selectedMission = nullptr;
};
} // namespace md::presentation

#endif // MISSIONS_CONTROLLER_H
