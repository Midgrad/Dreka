#ifndef MISSION_PATTERN_CONTROLLER_H
#define MISSION_PATTERN_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionPatternController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant missionId READ missionId WRITE selectMission NOTIFY missionChanged)
    Q_PROPERTY(QVariant pattern READ pattern NOTIFY patternChanged)
    Q_PROPERTY(QJsonArray parameters READ parameters NOTIFY patternChanged)
    Q_PROPERTY(QJsonObject parameterValues READ parameterValues NOTIFY parameterValuesChanged)
    Q_PROPERTY(QJsonArray pathPositions READ pathPositions NOTIFY pathPositionsChanged)
    Q_PROPERTY(bool ready READ isReady NOTIFY pathPositionsChanged)

public:
    explicit MissionPatternController(QObject* parent = nullptr);

    QVariant missionId() const;
    QVariant pattern() const;
    QJsonArray parameters() const;
    QJsonObject parameterValues() const;
    QJsonArray pathPositions() const;
    bool isReady() const;

    Q_INVOKABLE QJsonArray areaPositions() const;

public slots:
    void selectMission(const QVariant& missionId);
    void createPattern(const QString& patternTypeId);
    void setParameter(const QString& parameterId, const QVariant& value);
    void setAreaPositions(const QVariantList& positions);
    void cancel();
    void apply();

signals:
    void patternChanged();
    void missionChanged();
    void parameterValuesChanged();
    void pathPositionsChanged();

private:
    domain::IMissionsService* const m_missionsService;

    domain::Mission* m_mission = nullptr;
    domain::RoutePattern* m_pattern = nullptr;
};
} // namespace md::presentation

#endif // MISSION_PATTERN_CONTROLLER_H
