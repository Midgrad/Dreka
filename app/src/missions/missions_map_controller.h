#ifndef MISSIONS_MAP_CONTROLLER_H
#define MISSIONS_MAP_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionsMapController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant selectedMissionId READ selectedMissionId WRITE selectMission NOTIFY
                   selectedMissionChanged)

public:
    explicit MissionsMapController(QObject* parent = nullptr);

    QVariant selectedMissionId() const;

    Q_INVOKABLE QJsonArray missions() const;
    Q_INVOKABLE QJsonObject route(const QVariant& missionId) const;
    Q_INVOKABLE QJsonArray routeItems(const QVariant& missionId) const;

public slots:
    void selectMission(const QVariant& missionId);

signals:
    void selectedMissionChanged(QVariant missionId);

    void missionAdded(QVariantMap mission);
    void missionChanged(QVariantMap mission);
    void missionRemoved(QVariant missionId);

private:
    domain::IMissionsService* const m_missions;

    QVariant m_selectedMissionId;
};
} // namespace md::presentation

#endif // MISSIONS_MAP_CONTROLLER_H
