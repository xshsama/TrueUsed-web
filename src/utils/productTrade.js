const SELLER_CONDITION_LABELS = {
    NEW: '全新',
    LIKE_NEW: '95新',
    GOOD: '9成新',
    FAIR: '8成新',
    POOR: '战损版'
};

const INSPECTION_GRADE_LABELS = {
    S: 'S级成色',
    A: 'A级成色',
    B: 'B级成色',
    C: 'C级成色',
    X: '未通过验货'
};

export function formatSellerClaimCondition(code) {
    return SELLER_CONDITION_LABELS[code] || code || '';
}

export function formatPlatformInspectionGrade(code) {
    return INSPECTION_GRADE_LABELS[code] || (code ? `${code}级成色` : '');
}

export function isOfficialInspectionTrade(product = {}) {
    return product.tradeModel === 'OFFICIAL_INSPECTION' || product.isOfficial === true;
}

export function normalizeProductTrade(product = {}) {
    const tradeMode = isOfficialInspectionTrade(product)
        ? 'OFFICIAL_INSPECTION'
        : (product.tradeModel || 'FREE_TRADING');
    const hasPlatformInspection = tradeMode === 'OFFICIAL_INSPECTION';
    const sellerClaimConditionCode = product.sellerClaimCondition || product.condition || '';
    const sellerClaimConditionLabel = formatSellerClaimCondition(sellerClaimConditionCode);
    const platformInspectionGradeCode = product.inspectionGrade || '';
    const platformInspectionGradeLabel = formatPlatformInspectionGrade(platformInspectionGradeCode);

    let inspectionStatus = 'not_applicable';
    if (hasPlatformInspection) {
        if (platformInspectionGradeCode === 'X') {
            inspectionStatus = 'rejected';
        } else if (platformInspectionGradeCode) {
            inspectionStatus = 'passed';
        } else {
            inspectionStatus = 'pending';
        }
    }

    return {
        tradeMode,
        tradeModeLabel: hasPlatformInspection ? '平台验货' : '卖家自出',
        hasPlatformInspection,
        inspectionStatus,
        sellerClaimConditionCode,
        sellerClaimConditionLabel,
        platformInspectionGradeCode,
        platformInspectionGradeLabel,
        primaryConditionLabel: hasPlatformInspection
            ? (platformInspectionGradeLabel || '待平台验货')
            : (sellerClaimConditionLabel || '成色待补充'),
        secondaryConditionLabel: hasPlatformInspection
            ? (sellerClaimConditionLabel ? `卖家自述 ${sellerClaimConditionLabel}` : '卖家成色待补充')
            : '',
        inspectionFee: hasPlatformInspection ? Number(product.inspectionFee ?? 29) : 0
    };
}
